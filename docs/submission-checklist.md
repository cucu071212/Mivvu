# GateWise — final submission checklist

GW-021/023, prepared 2026-10-24 (Eastern Time). Documentation package only; **not submitted**. The Engineering Lead owns final publishing. An unchecked box is pending, not a failed or completed check.

## Official event milestones

Checked 2026-10-24 against the organizer's [HackPSU Fall 2026 Devpost requirements](https://hackpsu-fall-2026.devpost.com/) and [rules](https://hackpsu-fall-2026.devpost.com/rules).

- **Create the Devpost submission by October 25, 2026, 12:00 AM EDT (midnight).** This is earlier than the noon milestone; do not wait until noon to create the entry.
- **Hard submission deadline: October 25, 2026, 12:00 PM EDT (noon).** Existing submissions may be edited until October 25, 2026, 1:45 PM EDT according to the event text. Use noon as the completion gate, not an extension to delay initial submission.
- Event requirements specify a video of **at most five minutes**, attached project code (preferably public GitHub) and all team members listed. Rules also require citations for templates/open-source resources and limit teams to five people and one project.

**Deadline discrepancy:** the same Devpost page header displays October 25 at 2:00 PM EDT, while its requirements say midnight creation/noon submission and 1:45 PM editing cutoff. Use the written midnight/noon requirements; the conflicting 2 PM header does not extend them. Escalate organizer updates without delaying the earlier milestones. No team compliance is asserted here.

## Package and Devpost fields

- [x] Project name, tagline, pitch, inspiration, functionality, architecture, challenges, limitations, future work and Built With copy prepared in [devpost-submission.md](devpost-submission.md).
- [x] Production link included: [GateWise live MVP](https://gate-wise-iota.vercel.app). Reopened during finalization; B+C smoke evidence is in [consolidated-qa-report.md](consolidated-qa-report.md).
- [x] Source repository identified: [cucu071212/GateWise](https://github.com/cucu071212/GateWise). GitHub metadata checked 2026-10-24 reports **private**. This is not an anonymously accessible code-delivery link; judge access remains pending.
- [x] [README replacement](README-draft.md), [shot list and 2–3 minute script](demo-script.md) prepared.
- [ ] Lead adopts README and submission documentation on the final integration branch; fix `docs/`-relative links if moving README to root. Do not replace another owner's concurrent edits blindly.
- [ ] Enter final copy in Devpost and remove internal handoff notes; check all required fields/tracks shown by the actual form. Form/account state has not been inspected here.
- [ ] Add actual team names, Devpost accounts, accurate roles/contributions and any required eligibility/disclosure answers. Do not invent names, registrations or eligibility attestations.
- [ ] Cite official SFO provenance, common templates/packages and other resources used. Confirm any event-requested tool/AI-use disclosure accurately describes development assistance without claiming AI inference in the app.
- [ ] Choose appropriate tracks only after checking their requirements. Confirm each team member is listed and accepts any required invitation.

## Field inventory and unresolved placeholders

The known narrative fields have prepared content; the authenticated Devpost form, selected-track questions and required-field indicators have **not** been inspected. Do not claim every actual form field is complete until the human checks it.

| Field | Prepared content / remaining action |
| --- | --- |
| Name, tagline, pitch | Ready in Devpost copy. |
| Inspiration, what it does, how built | Ready in Devpost copy. |
| Challenges, accomplishments, lessons, next steps | Explicit sections ready in Devpost copy. |
| Built With / technologies | Ready; select the matching form tags. |
| Try-it/live URL | Production URL prepared; final-deployment check remains pending. |
| Team members | **MISSING:** actual names/accounts, membership confirmations and accurate contributions. |
| Video | **MISSING:** recording/export, accessible host URL and playback check; script/shot list are prepared. |
| Screenshots / project image | **MISSING:** final selected files/captions and uploaded assets. The temporary QA screenshot is not a completed submission asset. Check the form's image requirements. |
| Source code | **ACCESS BLOCKER:** current URL is private. Replace with a reviewed accessible delivery URL or obtain organizer-approved access before marking complete. |
| Tracks, eligibility, disclosures | **HUMAN CONFIRMATION:** actual form/event-specific answers, not invented placeholders. |

### Safe source-code delivery recommendation

Keep the working repository private unless its owner explicitly authorizes a visibility change. Prefer an owner-approved, separate public submission repository containing a reviewed snapshot of the exact final project source, lockfile, run instructions, licenses and resource credits. Record the source commit; omit credentials, environment files, private attachments and unrelated material. Review before publishing and test the new link anonymously. No export or publishing is performed here.

Alternatively, ask organizers to accept a reviewed source archive or private repository access for named judges. A private ZIP link is still access-controlled; an archive must be delivered through an approved accessible channel. Do not imply that a bare private GitHub URL satisfies code delivery. GitHub documents [private access restrictions](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories) and [commit-based source snapshots without full history](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives).

## Live build, screenshots and video

- [ ] Record final production Git SHA and deployment time; confirm URL opens anonymously after the final deployment.
- [ ] Re-run core browsing/What-if smoke on that build: estimates off → unknown; estimates on → required 34 at buffer 10, +16 at 50; scenario 35 → +1; add queue +7 → −6. Preserve baseline main inputs.
- [ ] Confirm boundary margins −1/0/9/10; source/estimate separation; invalid inputs; unknown/security policy; available automated checks. Record actual results, never infer them from this checklist.
- [ ] Complete mobile/zoom/keyboard/accessibility checks from [release-qa-prep.md](release-qa-prep.md); document unresolved limitations.
- [ ] Capture final-build screenshots: scope/12 records, sourced facts plus demo-estimate breakdown, What-if comparison. Make text readable and include the important caveats. Upload actual assets; this checklist is not an asset.
- [ ] Record and time the script (target 2–3 minutes; event maximum five); include who the team is, motivation, implementation and future plans.
- [ ] Watch the exported video; verify clear sound, readable results, no secrets/personal tabs and accurate narration. Upload using an event-accepted host; put the real video URL in Devpost.
- [ ] Open screenshots/video/repository/live links anonymously and verify access. No video URL or final submission screenshots have been supplied to this package.

## Data and optional-feature claims

- [ ] Keep official SFO identity/location/security provenance separate from synthetic queue 8, activity 10 and travel 3 per directed leg. Official source dates do not establish current opening or availability.
- [ ] Preserve null source durations; describe opt-in timing as temporary in-memory demo estimates. Production scope is Terminal 2 D Gates, not illustrative E/F.
- [ ] Keep “minutes until boarding starts,” model-only status language and no boarding-success guarantee throughout copy/video.
- [ ] Obtain Engineering Lead deployment confirmation and verify GW-015 on the live production page **before** calling it deployed or capturing it as a completed feature. At finalization, integration branch `15cf5c0` exists but the production check did not show the schematic; exact deployed SHA is unverified.
- [ ] If deployed, check all 12 schematic entries, source/confidence labels, no-route/geography disclaimer and unchanged B+C calculations. Otherwise omit schematic from completed-feature claims and use the base demo script.
- [ ] Do not claim GW-E, two-stop planning, live flight integrations, real-time data, measured navigation or an AI model exists.

## Human submission and receipt

- [ ] Create the entry before the midnight milestone; record creation time and project URL.
- [ ] Complete the submission before noon; verify the actual Devpost status/receipt, team listing, selected event and required attachments. A saved draft alone is not submission confirmation.
- [ ] Save a confirmation screenshot/time and review published links. Have at least one team member ready for the judging exposition, as required by the event.
- [ ] Confirm the conflicting header/requirements times with organizers; preserve a working demo and avoid optional scope expansion.

**Current handoff:** copy and checklist ready; recording/upload, team fields, accessible source-code delivery, final deployment evidence and actual Devpost submission remain pending. This task does not merge, deploy, accept event terms or submit on the team's behalf.
