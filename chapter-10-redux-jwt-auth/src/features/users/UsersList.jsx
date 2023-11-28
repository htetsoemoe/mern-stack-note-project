import React from 'react'
import { useGetUsersQuery } from './usersApiSlice'
import User from './User'

const UsersList = () => {

  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetUsersQuery("usersList", {
    pollingInterval: 60000, // How frequently to automatically re-fetch data (in milliseconds). Defaults to 0 (off).
    refetchOnFocus: true, // Defaults to false. This setting allows you to control whether RTK Query will try to refetch all subscribed queries after the application window regains focus.
    refetchOnMountOrArgChange: true
  })

  let content

  if (isLoading) {
    content = <p>Loading...</p>
  }

  // If there is no note, return server error response
  if (isError) {
    content = <p className='errmsg'>{error?.data?.message}</p>
  }

  if (isSuccess) {
    const { ids } = users
    const tableContent = ids?.length
      ? ids.map(userId => <User key={userId} userId={userId} />)
      : null

    content = (
      <table className="table table--users">
        <thead className="table__thead">
          <tr>
            <th scope="col" className="table__th user__username">Username</th>
            <th scope="col" className="table__th user__roles">Roles</th>
            <th scope="col" className="table__th user__edit">Edit</th>
          </tr>
        </thead>
        <tbody>
          {tableContent}
        </tbody>
      </table>
    )
  }

  return content
}

export default UsersList
