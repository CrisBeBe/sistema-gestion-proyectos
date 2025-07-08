import {AuthHeaders} from "@/types"

export function getAuthHeader(token: string, headers: { [key: string]: string } = {}): AuthHeaders {
    return {
        authorization: `Bearer ${token}`,
        ...headers
    }
  }