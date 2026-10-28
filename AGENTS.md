## Nexora architecture

- Keep replaceable site, team, services, project and form-definition data in src/data; presentation reads these modules so sample content can be replaced independently.
- Use TanStack file routes with the shared shell in the root route; the projects parent renders Outlet for listing and detail pages.
- Backend is Supabase via src/lib/supabase.ts. Never use a service-role key in frontend code. Run npm run build after each task. Never rewrite git history.
- The empty chat dialog contains no AI conversation, messages, tools, or composer; AI Elements are not applicable until those capabilities are introduced.
- Define all visual roles and responsive styles in src/styles.css and use the existing Button primitive for controls.
