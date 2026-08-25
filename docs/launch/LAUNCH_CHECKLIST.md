# NeedThisDone hosted-promotion checklist

Use this only after a separate owner approval for the specific promotion. No
item authorizes a later item.

1. Freeze and review the exact `dev` commit and local evidence.
2. Create and verify a recoverable hosted backup.
3. Review the intended forward migrations and run a dry run using
   `scripts/hosted-migration-stages.json`.
4. Obtain separate approval, then apply the reviewed migrations; rollback is
   forward-only.
5. Deploy the reviewed application commit.
6. Provision or rotate only the secrets needed for the approved scope.
7. Run the explicitly approved bounded provider or worker canary.
8. Record result, monitoring, rollback owner, and a go/no-go decision before
   any broader activation.

Never reset hosted Supabase, expose the Mac mini publicly, or treat local tests
as hosted, provider, or customer proof.
