import { useState } from 'react'
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'
import { useToast } from '@/store/ToastContext'

interface PaymentFormProps {
    onSuccess: () => void
    total: number
    formatPrice: (price: number) => string
}

export function PaymentForm({ onSuccess, total, formatPrice }: PaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const { addToast } = useToast()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsProcessing(true)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is not strictly needed if we handle success on the same page
                // but Stripe requires one. We'll use the current page.
                return_url: window.location.origin + '/checkout?payment_success=true',
            },
            redirect: 'if_required',
        })

        if (error) {
            addToast(error.message || 'Payment failed', 'error')
            setIsProcessing(false)
        } else {
            onSuccess()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="btn-primary btn-lg w-full"
            >
                {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
            </button>
        </form>
    )
}
