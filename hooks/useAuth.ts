// hooks/useAuth.ts - Custom authentication hooks
import { useSession as useNextAuthSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { isAdminRole, isTeacherRole, isSuperAdminRole } from "@/lib/roles"

export function useSession() {
  const session = useNextAuthSession()
  
  return {
    ...session,
    user: session.data?.user || null,
    isAuthenticated: !!session.data?.user,
    isLoading: session.status === "loading"
  }
}

export function useUser() {
  const { data: session } = useNextAuthSession()
  return session?.user || null
}

export function useRole() {
  const { data: session } = useNextAuthSession()
  return session?.user?.role || null
}

export function useIsAdmin() {
  const role = useRole()
  return role ? isAdminRole(role) : false
}

export function useIsSuperAdmin() {
  const role = useRole()
  return role ? isSuperAdminRole(role) : false
}

export function useIsTeacher() {
  const role = useRole()
  return role ? isTeacherRole(role) : false
}

export function useIsStudent() {
  const role = useRole()
  return role === UserRole.STUDENT
}

export function useSchool() {
  const { data: session } = useNextAuthSession()
  return {
    schoolId: session?.user?.schoolId || null,
    school: session?.user?.school || null
  }
}

export function useGradeLevel() {
  const { data: session } = useNextAuthSession()
  return session?.user?.gradeLevel || null
}

// Higher-order component for role-based access
export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function RoleProtectedComponent(props: P) {
    const role = useRole()
    const { status } = useNextAuthSession()
    
    if (status === "loading") {
      return <div>Loading...</div>
    }
    
    if (!role || !allowedRoles.includes(role)) {
      return <div>Access denied</div>
    }
    
    return <Component {...props} />
  }
}

// Hook for checking specific permissions
export function usePermissions() {
  const role = useRole()
  const { schoolId } = useSchool()
  
  return {
    canAccessAdmin: role ? isAdminRole(role) : false,
    canAccessTeacher: role ? isTeacherRole(role) : false,
    canManageUsers: role ? isAdminRole(role) : false,
    canManageSchool: role ? isAdminRole(role) && !!schoolId : false,
    canManageDistrict: role ? isSuperAdminRole(role) : false,
    canCreateContent: role ? isAdminRole(role) : false,
    canModerateContent: role ? isTeacherRole(role) : false,
    canViewAnalytics: role ? isTeacherRole(role) : false,
    canUseAITools: role ? isTeacherRole(role) : false
  }
}