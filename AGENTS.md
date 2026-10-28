<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Nexora architecture

- Keep replaceable site, team, services, project and form-definition data in src/data; presentation reads these modules so sample content can be replaced independently.
- Use TanStack file routes with the shared shell in the root route; the projects parent renders Outlet for listing and detail pages.
- Keep request submission, login and chat browser-only and nonpersistent until backend functionality is requested.
- The empty chat dialog contains no AI conversation, messages, tools, or composer; AI Elements are not applicable until those capabilities are introduced.
- Define all visual roles and responsive styles in src/styles.css and use the existing Button primitive for controls.
