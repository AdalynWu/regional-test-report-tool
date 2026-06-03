import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // base must match the GitHub Pages repo name. If the repo is renamed or
  // moved (e.g. to a company qa repo), update this accordingly.
  base: '/regional-test-report-tool/',
  plugins: [react()],
})
