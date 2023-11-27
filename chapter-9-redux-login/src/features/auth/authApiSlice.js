import { apiSlice } from "../../app/api/apiSlice";
import { logOut } from "./authSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/auth',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        sendLogout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            // A function that is called when the individual mutation is started. 
            // The function is called with a lifecycle api object containing properties such as queryFulfilled, 
            // allowing code to be run when a query is started, when it succeeds, 
            // and when it fails (i.e. throughout the lifecycle of an individual query/mutation call).
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    console.log(data)
                    dispatch(logOut())
                    dispatch(apiSlice.util.resetApiState())
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'GET',
            })
        }),
    })
})

export const { useLoginMutation, useSendLogoutMutation, useRefreshMutation } = authApiSlice
