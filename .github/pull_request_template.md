## Summary
<!-- What does this PR do? 1-3 bullet points. -->

-

## Type of Change
<!-- Check the relevant option(s) -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would break existing functionality)
- [ ] Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] Docs (documentation only)
- [ ] CI/CD (changes to build/deploy pipeline)

## Test Plan
<!-- How did you verify this works? -->

- [ ] Unit tests added/updated
- [ ] Tested locally with `npm run dev`
- [ ] Type-check passes (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)

## Security Checklist
<!-- For changes touching auth, agents, or API routes -->

- [ ] No hardcoded secrets or API keys
- [ ] Uses `requireActiveOrg()` or `requireResourceAccess()` for auth
- [ ] Rate limiting applied to new endpoints
- [ ] Input validation with Zod schemas
- [ ] Error responses are sanitized (no stack traces in production)

## Screenshots / Preview URL
<!-- If applicable, add screenshots or the preview deploy URL -->
