"use strict";

const ROUTE_FILE_PATTERN = /\/src\/app\/api\/.*\/route\.ts$/;
const HTTP_VERBS = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "API route exports must be wrapped in withAuth",
    },
    messages: {
      missing:
        "Route export `{{name}}` must be wrapped in withAuth(...). See the canteen-route-protection skill.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename?.();
    if (!filename || !ROUTE_FILE_PATTERN.test(filename)) {
      return {};
    }
    return {
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        if (!decl) return;

        if (decl.type === "VariableDeclaration") {
          for (const v of decl.declarations) {
            if (v.id.type !== "Identifier" || !HTTP_VERBS.has(v.id.name)) continue;
            const init = v.init;
            const isWrapped =
              init &&
              init.type === "CallExpression" &&
              init.callee.type === "Identifier" &&
              init.callee.name === "withAuth";
            if (!isWrapped) {
              context.report({
                node: v,
                messageId: "missing",
                data: { name: v.id.name },
              });
            }
          }
          return;
        }

        // `export async function GET() { ... }` — never wrapped.
        if (
          decl.type === "FunctionDeclaration" &&
          decl.id &&
          decl.id.type === "Identifier" &&
          HTTP_VERBS.has(decl.id.name)
        ) {
          context.report({
            node: decl,
            messageId: "missing",
            data: { name: decl.id.name },
          });
        }
      },
    };
  },
};
