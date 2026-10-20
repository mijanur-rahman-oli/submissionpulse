import { ApiError } from "./api"

export function projectErrorToMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "DuplicateProjectName":
        return "You already submitted a project with this name."
      case "DuplicateRepoUrl":
        return "You already submitted a project from this repository URL."
      case "TooManySubmissions":
        return "You've reached the submission limit (5 per hour). Try again later."
      case "ValidationError": {
        if (Array.isArray(err.issues) && err.issues.length > 0) {
          const first = err.issues[0] as { path?: (string | number)[]; message?: string }
          const field = Array.isArray(first.path) ? first.path.join(".") : ""
          return `${field ? field + ": " : ""}${first.message ?? "Invalid input"}`
        }
        return "Please check your input and try again."
      }
      case "Unauthorized":
        return "Your session expired. Please sign in again."
      default:
        return err.message || "Something went wrong. Try again."
    }
  }
  return "Something went wrong. Try again."
}