
import { useState } from 'react'
import { Plus, Check, LoaderCircle } from 'lucide-react'
import { followUser } from '../../services/followService'

interface Props {
    userId: string
    followerStatusId: number
    onNotice: (message: string) => void
}

export function ConnectionButton({
    userId,
    followerStatusId,
    onNotice,
}: Props) {
    const [loading, setLoading] = useState(false)

    const requested = followerStatusId === 1
    const connected = followerStatusId === 2

    async function handleConnect() {
        if (loading || requested || connected) return

        try {
            setLoading(true)

            await followUser(userId)

            onNotice('Solicitação de amizade enviada com sucesso!')

            // A atualização definitiva do status virá da API.
        } catch (error) {
            console.error('Erro ao enviar solicitação:', error)
            onNotice('Não foi possível enviar a solicitação.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            className="feed-connect"
            onClick={handleConnect}
            disabled={loading || requested || connected}
        >
            {loading ? (
                <LoaderCircle size={15} />
            ) : requested || connected ? (
                <Check size={15} />
            ) : (
                <Plus size={15} />
            )}

            {loading
                ? 'Enviando...'
                : requested
                    ? 'Solicitação enviada'
                    : connected
                        ? 'Conectado'
                        : 'Conectar'}
        </button>
    )
}
