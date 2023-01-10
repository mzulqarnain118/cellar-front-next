import { FormEvent, useState } from 'react'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

import { HOME_PAGE_PATH } from '@/lib/paths'

const SignInPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await signIn('sign-in', { email, password, redirect: false })
    router.push(HOME_PAGE_PATH)
  }

  return (
    <main>
      <div className="container mx-auto">
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Log in</button>
        </form>
      </div>
    </main>
  )
}

export default SignInPage
