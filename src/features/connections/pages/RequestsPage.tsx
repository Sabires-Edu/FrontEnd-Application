
import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import {
    getPendingFollows,
    updateFollowStatus
} from '../../../services/followService'
import type { FollowUser } from '../../../services/followService'
import { CommunityShell } from '../../../components/layout/CommunityShell'

export function RequestsPage() {
    const [requests, setRequests] = useState<FollowUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [processingUserId, setProcessingUserId] = useState<string | null>(null)

    useEffect(() => {
        async function loadRequests() {
            try {
                setLoading(true)
                setError('')

                const response = await getPendingFollows()

                setRequests(response.response.users)
            } catch (error) {
                console.error('Erro ao carregar solicitações:', error)
                setError('Não foi possível carregar as solicitações.')
            } finally {
                setLoading(false)
            }
        }

        loadRequests()
    }, [])

    async function handleRequestAction(userId: string, status: number) {
        try {
            setProcessingUserId(userId)

            await updateFollowStatus(userId, status)

            window.dispatchEvent(new Event('sabires:pending-requests-updated'))

            setRequests((currentRequests) =>
                currentRequests.filter((request) => request.userid !== userId)
            )

            setNotice(
                status === 2
                    ? 'Solicitação aceita com sucesso!'
                    : 'Solicitação recusada.'
            )
        } catch (error) {
            console.error('Erro ao atualizar solicitação:', error)
            setNotice('Não foi possível atualizar a solicitação.')
        } finally {
            setProcessingUserId(null)
        }
    }

    return (
        <CommunityShell
            view="requests"
            eyebrow="SUAS CONEXÕES"
            title="Solicitações de amizade."
            notice={notice}
            onNotice={setNotice}
            showDemoNotice={false}

        >
            <section className="feed-panel requests-panel">
                <div className="feed-section-heading">
                    <h2>Solicitações recebidas</h2>
                    <Users size={20} />
                </div>

                {loading ? (
                    <p>Carregando solicitações...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : requests.length > 0 ? (
                    <div className="requests-list">
                        {requests.map((request) => (
                            <div
                                className="request-card"
                                key={request.userid}
                            >
                                <div className="request-user">
                                    {request.profilepicture ? (
                                        <img
                                            src={request.profilepicture}
                                            alt={`${request.firstname} ${request.lastname}`}
                                            className="request-avatar"
                                        />
                                    ) : (
                                        <div className="request-avatar-placeholder">
                                            {request.firstname.charAt(0)}
                                        </div>
                                    )}

                                    <div className="request-user-info">
                                        <h3>
                                            {request.firstname} {request.lastname}
                                        </h3>

                                        <p>
                                            {request.biography || 'Estudante do Sabires'}
                                        </p>
                                    </div>
                                </div>

                                <div className="request-actions">
                                    <button
                                        className="request-button accept"
                                        onClick={() => handleRequestAction(request.userid, 2)}
                                        disabled={processingUserId === request.userid}
                                    >
                                        {processingUserId === request.userid
                                            ? 'Aguarde...'
                                            : 'Aceitar'}
                                    </button>

                                    <button
                                        className="request-button reject"
                                        onClick={() => handleRequestAction(request.userid, 3)}
                                        disabled={processingUserId === request.userid}
                                    >
                                        Recusar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Você não possui solicitações pendentes.</p>
                )}
            </section>
        </CommunityShell>
    )
}
