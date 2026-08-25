/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
/**
 * Agent platform single sign-on configuration.
 *
 * The "Agent Platform" top-nav button (see hooks/use-top-nav-links.ts)
 * redirects a signed-in user to the agent platform login page carrying
 * their current session token as a query parameter:
 *
 *   {baseUrl}{entryPath}?relay={relayName}&newapi_token={accessToken}
 *
 * Adjust the values below for your deployment.
 */
export const agentPlatform = {
  baseUrl: 'https://api.chase-science.cn',
  relayName: 'chase-science',
  entryPath: '/agent/login',
} as const

export function agentPlatformLoginUrl(accessToken: string): string {
  const search = new URLSearchParams({
    relay: agentPlatform.relayName,
    newapi_token: accessToken,
  })
  return `${agentPlatform.baseUrl}${agentPlatform.entryPath}?${search.toString()}`
}
