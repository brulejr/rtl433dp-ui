import type { TFunction } from "i18next";
import { HttpError } from "./http";

export function toUserMessage(err: unknown, t: TFunction): string {
  if (err instanceof HttpError) {
    if (err.status === 401 || err.status === 403) return t("common:errors.unauthorized");
  }
  return t("common:errors.generic");
}
