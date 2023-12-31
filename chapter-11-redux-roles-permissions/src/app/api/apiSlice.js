import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3500',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        // If we have a token set in state, let's assume that we should be passing it.
        const token = getState().auth.token

        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReAuth = async (args, api, extraOptions) => {
    // console.log(args) // request url, method, body 
    // console.log(api) // signal, dispatch, getState()
    // console.log(extraOptions) //custom like {shout: true}

    let result = await baseQuery(args, api, extraOptions)
    console.log(result)

    // If you want, handle other status codes, too
    if (result?.error?.status === 403) {
        console.log('Sending refresh token')

        // Send refresh token to get new access token
        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)

        if (refreshResult?.data) {
            // Store the new access token
            api.dispatch(setCredentials({ ...refreshResult.data }))

            // Retry original query with new access token
            result = await baseQuery(args, api, extraOptions)

        } else {
            if (refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = "Your login has expired."
            }
            return refreshResult
        }

    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReAuth,
    tagTypes: ['Note', 'User'],
    endpoints: builder => ({})
})