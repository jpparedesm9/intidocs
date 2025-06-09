import GmailInterface from "@/components/gmail-interface"
import { AuthGuard } from "@/components/auth-guard"

export default function Home() {
  return (
    <AuthGuard>
      <GmailInterface />
    </AuthGuard>
  )
}
