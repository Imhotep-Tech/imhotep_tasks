import { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DesktopAuthHandler = () => {
	const navigate = useNavigate()
	const { login } = useAuth()

	useEffect(() => {
		function onMessage(e) {
			if (!e?.data || e.data.type !== 'desktop:auth-callback') return
			try {
				const url = new URL(e.data.url)
				const code = url.searchParams.get('code')
				if (!code) return
				;(async () => {
					try {
						const response = await axios.post('/api/auth/google/authenticate/', { code })
						const { access, refresh, user: userData, is_new_user } = response.data
						login({ access, refresh, user: userData })
						navigate('/today-tasks')
					} catch (err) {
						console.error('Desktop OAuth finish failed', err)
						navigate('/login')
					}
				})()
			} catch (err) {
				console.error('Invalid desktop auth callback URL', err)
			}
		}
		window.addEventListener('message', onMessage)
		return () => window.removeEventListener('message', onMessage)
	}, [login, navigate])

	return null
}

export default DesktopAuthHandler
