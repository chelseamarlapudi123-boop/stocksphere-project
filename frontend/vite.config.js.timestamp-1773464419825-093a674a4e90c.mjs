var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .vite-source-tags.js
var vite_source_tags_exports = {};
__export(vite_source_tags_exports, {
  sourceTags: () => sourceTags
});
import { parse } from "file:///C:/Users/chelsea/OneDrive/Documents/college/Major%20Project/agon-agent_1-461317af/frontend/node_modules/@babel/parser/lib/index.js";
import _traverse from "file:///C:/Users/chelsea/OneDrive/Documents/college/Major%20Project/agon-agent_1-461317af/frontend/node_modules/@babel/traverse/lib/index.js";
import _generate from "file:///C:/Users/chelsea/OneDrive/Documents/college/Major%20Project/agon-agent_1-461317af/frontend/node_modules/@babel/generator/lib/index.js";
import * as t from "file:///C:/Users/chelsea/OneDrive/Documents/college/Major%20Project/agon-agent_1-461317af/frontend/node_modules/@babel/types/lib/index.js";
function sourceTags() {
  let projectRoot = "";
  return {
    name: "vite-source-tags",
    enforce: "pre",
    configResolved(config) {
      projectRoot = config.root;
    },
    transform(code, id) {
      if (!/\.[jt]sx$/.test(id)) return null;
      if (id.includes("node_modules")) return null;
      let ast;
      try {
        ast = parse(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        });
      } catch {
        return null;
      }
      let modified = false;
      traverse(ast, {
        JSXOpeningElement(path) {
          const node = path.node;
          if (t.isJSXIdentifier(node.name) && node.name.name === "Fragment") return;
          if (t.isJSXMemberExpression(node.name) && t.isJSXIdentifier(node.name.property) && node.name.property.name === "Fragment") return;
          if (!node.name.name && t.isJSXNamespacedName(node.name)) return;
          const loc = node.loc;
          if (!loc) return;
          const alreadyTagged = node.attributes.some(
            (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === "data-source-loc"
          );
          if (alreadyTagged) return;
          const relPath = id.startsWith(projectRoot) ? id.slice(projectRoot.length + 1) : id;
          const value = `${relPath}:${loc.start.line}:${loc.start.column}`;
          node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier("data-source-loc"),
              t.stringLiteral(value)
            )
          );
          modified = true;
        }
      });
      if (!modified) return null;
      const output = generate(ast, { retainLines: true }, code);
      return { code: output.code, map: output.map };
    }
  };
}
var traverse, generate;
var init_vite_source_tags = __esm({
  ".vite-source-tags.js"() {
    traverse = _traverse.default || _traverse;
    generate = _generate.default || _generate;
  }
});

// vite.config.js
import { defineConfig } from "file:///C:/Users/chelsea/OneDrive/Documents/college/Major%20Project/agon-agent_1-461317af/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/chelsea/OneDrive/Documents/college/Major%20Project/agon-agent_1-461317af/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/chelsea/OneDrive/Documents/college/Major%20Project/agon-agent_1-461317af/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    const m = await Promise.resolve().then(() => (init_vite_source_tags(), vite_source_tags_exports));
    plugins.push(m.sourceTags());
  } catch (error) {
  }
  return { plugins };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGUtc291cmNlLXRhZ3MuanMiLCAidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjaGVsc2VhXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxjb2xsZWdlXFxcXE1ham9yIFByb2plY3RcXFxcYWdvbi1hZ2VudF8xLTQ2MTMxN2FmXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjaGVsc2VhXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxjb2xsZWdlXFxcXE1ham9yIFByb2plY3RcXFxcYWdvbi1hZ2VudF8xLTQ2MTMxN2FmXFxcXGZyb250ZW5kXFxcXC52aXRlLXNvdXJjZS10YWdzLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9jaGVsc2VhL09uZURyaXZlL0RvY3VtZW50cy9jb2xsZWdlL01ham9yJTIwUHJvamVjdC9hZ29uLWFnZW50XzEtNDYxMzE3YWYvZnJvbnRlbmQvLnZpdGUtc291cmNlLXRhZ3MuanNcIjsvKipcbiAqIFZpdGUgcGx1Z2luIHRoYXQgYWRkcyBkYXRhLXNvdXJjZS1sb2M9XCJmaWxlOmxpbmU6Y29sXCIgYXR0cmlidXRlcyB0byBldmVyeVxuICogSlNYIGVsZW1lbnQgYXQgY29tcGlsZSB0aW1lLiBUaGlzIGVuYWJsZXMgdGhlIGVsZW1lbnQgcGlja2VyIHRvIG1hcCByZW5kZXJlZFxuICogRE9NIG5vZGVzIGJhY2sgdG8gdGhlaXIgc291cmNlIGZpbGUgYW5kIGxpbmUgbnVtYmVyLlxuICpcbiAqIEFjdGl2ZSBpbiBib3RoIGRldiBhbmQgYnVpbGQgc28gdGhlIGVsZW1lbnQgcGlja2VyIHdvcmtzIG9uIGRlcGxveWVkIHByZXZpZXdzLlxuICpcbiAqIFVzZXMgQGJhYmVsL3BhcnNlciwgQGJhYmVsL3RyYXZlcnNlLCBhbmQgQGJhYmVsL2dlbmVyYXRvciB3aGljaCBhcmUgYWxyZWFkeVxuICogdHJhbnNpdGl2ZSBkZXBlbmRlbmNpZXMgb2YgQHZpdGVqcy9wbHVnaW4tcmVhY3QgKG5vIGV4dHJhIGluc3RhbGwgbmVlZGVkKS5cbiAqL1xuXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJ0BiYWJlbC9wYXJzZXInO1xuaW1wb3J0IF90cmF2ZXJzZSBmcm9tICdAYmFiZWwvdHJhdmVyc2UnO1xuaW1wb3J0IF9nZW5lcmF0ZSBmcm9tICdAYmFiZWwvZ2VuZXJhdG9yJztcbmltcG9ydCAqIGFzIHQgZnJvbSAnQGJhYmVsL3R5cGVzJztcblxuLy8gSGFuZGxlIENKUyBkZWZhdWx0IGV4cG9ydCBpbnRlcm9wXG5jb25zdCB0cmF2ZXJzZSA9IF90cmF2ZXJzZS5kZWZhdWx0IHx8IF90cmF2ZXJzZTtcbmNvbnN0IGdlbmVyYXRlID0gX2dlbmVyYXRlLmRlZmF1bHQgfHwgX2dlbmVyYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gc291cmNlVGFncygpIHtcbiAgbGV0IHByb2plY3RSb290ID0gJyc7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1zb3VyY2UtdGFncycsXG4gICAgZW5mb3JjZTogJ3ByZScsXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWcpIHtcbiAgICAgIHByb2plY3RSb290ID0gY29uZmlnLnJvb3Q7XG4gICAgfSxcblxuICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgaWYgKCEvXFwuW2p0XXN4JC8udGVzdChpZCkpIHJldHVybiBudWxsO1xuICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGxldCBhc3Q7XG4gICAgICB0cnkge1xuICAgICAgICBhc3QgPSBwYXJzZShjb2RlLCB7XG4gICAgICAgICAgc291cmNlVHlwZTogJ21vZHVsZScsXG4gICAgICAgICAgcGx1Z2luczogWydqc3gnLCAndHlwZXNjcmlwdCddLFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgIHRyYXZlcnNlKGFzdCwge1xuICAgICAgICBKU1hPcGVuaW5nRWxlbWVudChwYXRoKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHBhdGgubm9kZTtcblxuICAgICAgICAgIC8vIFNraXAgZnJhZ21lbnRzICg8PiAvIDxSZWFjdC5GcmFnbWVudD4pXG4gICAgICAgICAgaWYgKHQuaXNKU1hJZGVudGlmaWVyKG5vZGUubmFtZSkgJiYgbm9kZS5uYW1lLm5hbWUgPT09ICdGcmFnbWVudCcpIHJldHVybjtcbiAgICAgICAgICBpZiAodC5pc0pTWE1lbWJlckV4cHJlc3Npb24obm9kZS5uYW1lKSAmJlxuICAgICAgICAgICAgICB0LmlzSlNYSWRlbnRpZmllcihub2RlLm5hbWUucHJvcGVydHkpICYmXG4gICAgICAgICAgICAgIG5vZGUubmFtZS5wcm9wZXJ0eS5uYW1lID09PSAnRnJhZ21lbnQnKSByZXR1cm47XG4gICAgICAgICAgaWYgKCFub2RlLm5hbWUubmFtZSAmJiB0LmlzSlNYTmFtZXNwYWNlZE5hbWUobm9kZS5uYW1lKSkgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgbG9jID0gbm9kZS5sb2M7XG4gICAgICAgICAgaWYgKCFsb2MpIHJldHVybjtcblxuICAgICAgICAgIC8vIFNraXAgaWYgYWxyZWFkeSB0YWdnZWQgKGF2b2lkIGRvdWJsZS10cmFuc2Zvcm0gb24gSE1SKVxuICAgICAgICAgIGNvbnN0IGFscmVhZHlUYWdnZWQgPSBub2RlLmF0dHJpYnV0ZXMuc29tZShcbiAgICAgICAgICAgIGF0dHIgPT4gdC5pc0pTWEF0dHJpYnV0ZShhdHRyKSAmJlxuICAgICAgICAgICAgICAgICAgICB0LmlzSlNYSWRlbnRpZmllcihhdHRyLm5hbWUpICYmXG4gICAgICAgICAgICAgICAgICAgIGF0dHIubmFtZS5uYW1lID09PSAnZGF0YS1zb3VyY2UtbG9jJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKGFscmVhZHlUYWdnZWQpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IHJlbFBhdGggPSBpZC5zdGFydHNXaXRoKHByb2plY3RSb290KVxuICAgICAgICAgICAgPyBpZC5zbGljZShwcm9qZWN0Um9vdC5sZW5ndGggKyAxKVxuICAgICAgICAgICAgOiBpZDtcblxuICAgICAgICAgIGNvbnN0IHZhbHVlID0gYCR7cmVsUGF0aH06JHtsb2Muc3RhcnQubGluZX06JHtsb2Muc3RhcnQuY29sdW1ufWA7XG5cbiAgICAgICAgICBub2RlLmF0dHJpYnV0ZXMucHVzaChcbiAgICAgICAgICAgIHQuanN4QXR0cmlidXRlKFxuICAgICAgICAgICAgICB0LmpzeElkZW50aWZpZXIoJ2RhdGEtc291cmNlLWxvYycpLFxuICAgICAgICAgICAgICB0LnN0cmluZ0xpdGVyYWwodmFsdWUpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIW1vZGlmaWVkKSByZXR1cm4gbnVsbDtcblxuICAgICAgY29uc3Qgb3V0cHV0ID0gZ2VuZXJhdGUoYXN0LCB7IHJldGFpbkxpbmVzOiB0cnVlIH0sIGNvZGUpO1xuICAgICAgcmV0dXJuIHsgY29kZTogb3V0cHV0LmNvZGUsIG1hcDogb3V0cHV0Lm1hcCB9O1xuICAgIH0sXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGNoZWxzZWFcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXGNvbGxlZ2VcXFxcTWFqb3IgUHJvamVjdFxcXFxhZ29uLWFnZW50XzEtNDYxMzE3YWZcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGNoZWxzZWFcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXGNvbGxlZ2VcXFxcTWFqb3IgUHJvamVjdFxcXFxhZ29uLWFnZW50XzEtNDYxMzE3YWZcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2NoZWxzZWEvT25lRHJpdmUvRG9jdW1lbnRzL2NvbGxlZ2UvTWFqb3IlMjBQcm9qZWN0L2Fnb24tYWdlbnRfMS00NjEzMTdhZi9mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnXG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+IHtcbiAgY29uc3QgcGx1Z2lucyA9IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXTtcbiAgdHJ5IHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIE9wdGlvbmFsIGxvY2FsIHBsdWdpbiBmaWxlIHRoYXQgbWF5IG5vdCBleGlzdCBpbiBhbGwgZW52aXJvbm1lbnRzLlxuICAgIGNvbnN0IG0gPSBhd2FpdCBpbXBvcnQoJy4vLnZpdGUtc291cmNlLXRhZ3MuanMnKTtcbiAgICBwbHVnaW5zLnB1c2gobS5zb3VyY2VUYWdzKCkpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHZvaWQgZXJyb3I7XG4gIH1cbiAgcmV0dXJuIHsgcGx1Z2lucyB9O1xufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFB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
