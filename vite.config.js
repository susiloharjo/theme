import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'demos/login.html'),
                dashboard: resolve(__dirname, 'demos/dashboard.html'),
                table: resolve(__dirname, 'demos/table.html'),
                form: resolve(__dirname, 'demos/form.html'),
            },
        },
    },
})
