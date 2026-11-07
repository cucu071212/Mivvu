import type { MivvuPreviewMessages } from "@/lib/mivvu-preview-messages";

/** Semantic save/remove outcome — resolved to KO/EN copy at render time. */
export type IcnSavedUserNoticeKind = "saved" | "removed" | "failed";

export function resolveIcnSavedUserNoticeMessage(
  kind: IcnSavedUserNoticeKind,
  messages: MivvuPreviewMessages,
): { text: string; error: boolean } {
  if (kind === "failed") {
    return { text: messages.icnSaveFail, error: true };
  }
  if (kind === "saved") {
    return { text: messages.icnSaveOk, error: false };
  }
  return { text: messages.icnSaveRemoved, error: false };
}
