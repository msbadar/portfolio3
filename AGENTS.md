# Portfolio site

## Basic information

- this project contain both server ( nest js ) and client ( next js )

## Dev environment tips

- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.
- should be using pnpm instead of npm

## Testing instructions

- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions

- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing.
