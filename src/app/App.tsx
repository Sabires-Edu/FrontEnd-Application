import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { FeedPage } from '../features/feed/pages/FeedPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { DemoSessionProvider } from '../features/demo/DemoSessionProvider'
import { UsersPage } from '../features/connections/pages/UsersPage'
import { PostsPage } from '../features/posts/pages/PostsPage'
import { MessagesPage } from '../features/messages/pages/MessagesPage'
import { RequestsPage } from '../features/connections/pages/RequestsPage'
import { TrashPage } from '../features/posts/pages/TrashPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DemoSessionProvider />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/solicitacoes" element={<RequestsPage />} />
            <Route path="/postagens" element={<PostsPage />} />
            <Route path="/mensagens" element={<MessagesPage />} />
            <Route path="/lixeira" element={<TrashPage />} />
            
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App