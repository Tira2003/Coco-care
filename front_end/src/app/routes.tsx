import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { DashboardLayout } from './components/DashboardLayout'
import { Dashboard } from './pages/Dashboard'
import { DiseaseDetection } from './pages/DiseaseDetection'
import { LeafDiseaseDiagnosis } from './pages/LeafDiseaseDiagnosis'
import { StemDiseaseDiagnosis } from './pages/StemDiseaseDiagnosis'
import { BudDiseaseDiagnosis } from './pages/BudDiseaseDiagnosis'
import { FruitDiseaseDiagnosis } from './pages/FruitDiseaseDiagnosis'
import { SymptomDiseaseDiagnosis } from './pages/SymptomDiseaseDiagnosis'
import { AIChatbot } from './pages/AIChatbot'
import { OfficerConsultations } from './pages/OfficerConsultations'
import { HelpCenter } from './pages/HelpCenter'
import { DiseaseHeatmap } from './pages/DiseaseHeatmap'
import { Notifications } from './pages/Notifications'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { OfficerLayout } from './layouts/OfficerLayout'
import { OfficerDashboard } from './pages/officer/OfficerDashboard'
import { ReportReviewPage } from './pages/officer/ReportReviewPage'
import { OfficerConsultationsPage } from './pages/officer/OfficerConsultationsPage'
import { OfficerHelpCenter } from './pages/officer/OfficerHelpCenter'
import { OfficerSettings } from './pages/officer/OfficerSettings'
import { AdminLayout } from './layouts/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { AdminFarmsPage } from './pages/admin/AdminFarmsPage'
import { AdminSystemPage } from './pages/admin/AdminSystemPage'
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  {
    element: <ProtectedRoute roles={['farmer']} />,
    children: [
      {
        path: '/app',
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'disease-detection', Component: DiseaseDetection },
          { path: 'disease-detection/leaves', Component: LeafDiseaseDiagnosis },
          { path: 'disease-detection/stem', Component: StemDiseaseDiagnosis },
          { path: 'disease-detection/bud', Component: BudDiseaseDiagnosis },
          { path: 'disease-detection/fruit', Component: FruitDiseaseDiagnosis },
          { path: 'disease-detection/symptoms/:category', Component: SymptomDiseaseDiagnosis },
          { path: 'chatbot', Component: AIChatbot },
          { path: 'consultations', Component: OfficerConsultations },
          { path: 'help', Component: HelpCenter },
          { path: 'heatmap', Component: DiseaseHeatmap },
          { path: 'notifications', Component: Notifications },
          { path: 'profile', Component: Profile },
          { path: 'settings', Component: Settings },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['officer']} />,
    children: [
      {
        path: '/officer',
        Component: OfficerLayout,
        children: [
          { index: true, Component: OfficerDashboard },
          { path: 'reports', Component: ReportReviewPage },
          { path: 'consultations', Component: OfficerConsultationsPage },
          { path: 'heatmap', Component: DiseaseHeatmap },
          { path: 'notifications', Component: Notifications },
          { path: 'help', Component: OfficerHelpCenter },
          { path: 'settings', Component: OfficerSettings },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['admin']} />,
    children: [
      {
        path: '/admin',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'users', Component: AdminUsersPage },
          { path: 'reports', Component: AdminReportsPage },
          { path: 'farms', Component: AdminFarmsPage },
          { path: 'system', Component: AdminSystemPage },
          { path: 'notifications', Component: AdminNotificationsPage },
        ],
      },
    ],
  },
])
