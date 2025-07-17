/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import {
    Dashboard,
    Assignment,
    Gavel,
    LibraryBooks,
    Map,
    Assessment,
    School,
    Settings,
    Backup,
    InsertDriveFile,
    People,
    Help,
    Notifications,
    Queue,
    TableChart,
    MapsHomeWork,
    Description,
    Report,
    Security
  } from '@mui/icons-material';
  
  export const staffRoutes = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/staff',
      icon: <Dashboard fontSize="small" />,
      exact: true,
      permission: 'view_dashboard',
      showInNav: true
    },
    {
      id: 'land-allocation',
      name: 'Land Allocation',
      icon: <Assignment fontSize="small" />,
      permission: 'manage_allocations',
      showInNav: true,
      subRoutes: [
        { 
          id: 'allocation-queue',
          name: 'Allocation Queue', 
          path: '/staff/land-allocation/queue',
          icon: <Queue fontSize="small" />,
          permission: 'view_queue',
          badge: true
        },
        { 
          id: 'allocation-table',
          name: 'Allocation Table', 
          path: '/staff/land-allocation/table',
          icon: <TableChart fontSize="small" />,
          permission: 'view_table'
        },
        { 
          id: 'allocated-plots',
          name: 'Allocated Plots', 
          path: '/staff/land-allocation/allocated',
          icon: <MapsHomeWork fontSize="small" />,
          permission: 'view_allocations'
        }
      ]
    },
    {
      id: 'dispute-resolution',
      name: 'Dispute Resolution',
      icon: <Gavel fontSize="small" />,
      permission: 'manage_disputes',
      showInNav: true,
      subRoutes: [
        {
          id: 'active-disputes',
          name: 'Active Cases',
          path: '/staff/disputes/active',
          permission: 'view_disputes'
        },
        {
          id: 'dispute-reports',
          name: 'Case Reports',
          path: '/staff/disputes/reports',
          icon: <Report fontSize="small" />,
          permission: 'view_reports'
        }
      ]
    },
    {
      id: 'land-records',
      name: 'Land Records',
      icon: <LibraryBooks fontSize="small" />,
      permission: 'manage_records',
      showInNav: true,
      subRoutes: [
        { 
          id: 'view-records',
          name: 'View Records', 
          path: '/staff/records',
          permission: 'view_records'
        },
        { 
          id: 'records-management',
          name: 'Records Management', 
          path: '/staff/records/management',
          permission: 'edit_records'
        },
        { 
          id: 'certificates',
          name: 'Certificates', 
          path: '/staff/records/certificates',
          icon: <Description fontSize="small" />,
          permission: 'manage_certificates'
        }
      ]
    },
    {
      id: 'gis',
      name: 'GIS Analysis',
      path: '/staff/gis',
      icon: <Map fontSize="small" />,
      permission: 'view_gis',
      showInNav: true
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      path: '/staff/reports',
      icon: <Assessment fontSize="small" />,
      permission: 'view_reports',
      showInNav: true
    },
    {
      id: 'training',
      name: 'Training Modules',
      path: '/staff/training',
      icon: <School fontSize="small" />,
      permission: 'view_training',
      showInNav: true
    },
    {
      id: 'admin',
      name: 'Administration',
      icon: <People fontSize="small" />,
      permission: 'admin_access',
      showInNav: true,
      subRoutes: [
        { 
          id: 'user-management',
          name: 'User Management', 
          path: '/staff/admin/users',
          icon: <Security fontSize="small" />,
          permission: 'manage_users'
        },
        { 
          id: 'backup',
          name: 'Backup & Restore', 
          path: '/staff/admin/backup',
          icon: <Backup fontSize="small" />,
          permission: 'system_backup'
        },
        { 
          id: 'settings',
          name: 'System Settings', 
          path: '/staff/admin/settings',
          icon: <Settings fontSize="small" />,
          permission: 'system_config'
        },
        { 
          id: 'notifications',
          name: 'Notification Center', 
          path: '/staff/admin/notifications',
          icon: <Notifications fontSize="small" />,
          permission: 'manage_notifications'
        }
      ]
    },
    {
      id: 'help',
      name: 'Help & Support',
      path: '/staff/help',
      icon: <Help fontSize="small" />,
      permission: 'basic_access',
      showInNav: true,
      divider: true
    }
  ];
  
  /**
   * Checks if user has required permission
   * @param {Array} userPermissions - Array of user's permissions
   * @param {String} requiredPermission - Permission to check
   * @returns {Boolean} - Whether user has permission
   */
  export const hasPermission = (userPermissions, requiredPermission) => {
    if (!requiredPermission) return true;
    return userPermissions?.includes(requiredPermission);
  };
  
  /**
   * Filters routes based on user permissions
   * @param {Array} userPermissions - Array of user's permissions
   * @returns {Array} - Filtered routes array
   */
  export const getFilteredRoutes = (userPermissions) => {
    return staffRoutes.filter(route => {
      // Skip if route shouldn't be shown in nav
      if (route.showInNav === false) return false;
      
      // Check main route permission
      if (!hasPermission(userPermissions, route.permission)) {
        return false;
      }
      
      // Filter subroutes if they exist
      if (route.subRoutes) {
        route.subRoutes = route.subRoutes.filter(subRoute => 
          subRoute.showInNav !== false && 
          hasPermission(userPermissions, subRoute.permission)
        );
        // Only show parent if there are visible subroutes or it has its own path
        return route.subRoutes.length > 0 || route.path;
      }
      
      return true;
    });
  };
  
  /**
   * Finds the current active route and its parent (if exists)
   * @param {String} pathname - Current path
   * @returns {Object|null} - Active route object with parent reference if applicable
   */
  export const getActiveRoute = (pathname) => {
    for (const route of staffRoutes) {
      // Check exact match for main route
      if (route.path === pathname) {
        return route;
      }
      
      // Check subroutes
      if (route.subRoutes) {
        const subRoute = route.subRoutes.find(sub => sub.path === pathname);
        if (subRoute) {
          return { 
            ...subRoute, 
            parent: {
              id: route.id,
              name: route.name,
              icon: route.icon
            } 
          };
        }
      }
    }
    return null;
  };
  
  /**
   * Gets breadcrumbs for current path
   * @param {String} pathname - Current path
   * @returns {Array} - Breadcrumb items array
   */
  export const getBreadcrumbs = (pathname) => {
    const activeRoute = getActiveRoute(pathname);
    if (!activeRoute) return [];
    
    if (activeRoute.parent) {
      return [
        { name: activeRoute.parent.name, path: activeRoute.parent.path },
        { name: activeRoute.name, path: activeRoute.path }
      ];
    }
    
    return [{ name: activeRoute.name, path: activeRoute.path }];
  };
  
  /**
   * Checks if route has badge/notification
   * @param {String} pathname - Route path to check
   * @returns {Boolean} - Whether route has badge
   */
  export const hasBadge = (pathname) => {
    for (const route of staffRoutes) {
      if (route.path === pathname && route.badge) return true;
      if (route.subRoutes) {
        const subRoute = route.subRoutes.find(sub => sub.path === pathname && sub.badge);
        if (subRoute) return true;
      }
    }
    return false;
  };