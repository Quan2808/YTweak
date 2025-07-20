import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        content: resolve(__dirname, "src/content/content.js"),
        background: resolve(__dirname, "src/background/background.js"),
        utils: resolve(__dirname, "src/utils/utils.js"),
        pipManager: resolve(__dirname, "src/content/pipManager.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop().replace(".js", "")
            : "chunk";
          return `${facadeModuleId}.js`;
        },
      },
    },
  },
});
