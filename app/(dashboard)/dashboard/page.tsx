"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function Dashboard() {

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return <p>Loading...</p>
  }

  return (
    <div>
      Welcome {session?.user?.name}
    </div>
  )
}

export default Dashboard