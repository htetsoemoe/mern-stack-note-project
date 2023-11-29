import { useSelector } from 'react-redux'
import { selectCurrentToken } from '../features/auth/authSlice'
import { jwtDecode } from 'jwt-decode'

const useAuth = () => {
    // Get 'accessToken' from redux store
    const token = useSelector(selectCurrentToken)

    let isManager = false
    let isAdmin = false
    let status = 'Employee'

    // If there's token
    if (token) {
        const decoded = jwtDecode(token)
        const { username, roles } = decoded.UserInfo

        isManager = roles.includes('Manager')
        isAdmin = roles.includes('Admin')

        if (isManager) {
            status = 'Manager'
        }

        if (isAdmin) {
            status = 'Admin'
        }

        return {
            username, roles, status, isManager, isAdmin
        }
    }

    // If there's no token
    return {
        username: '',
        roles: [],
        status,
        isManager,
        isAdmin
    }
}

export default useAuth