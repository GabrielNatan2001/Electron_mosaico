import { ativarEmailProprietario } from '@/api/services/authServices';
import Logo from '@/components/Logo';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

export default function EmailConfirmed() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            ativarEmailProprietario(id)
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen theme-gradient flex flex-col items-center justify-center text-white px-4">
            <Logo />

            <Card className="rounded-lg space-y-2 shadow-lg p-8 max-w-md w-full text-center border border-gray-500/30">
                <h2 className="text-lg font-semibold mb-6">{t("register.accountActivated")}</h2>

                <div className="flex justify-center animate-bounce">
                    <Send className='text-emerald-500' size={50} />
                </div>
                <p className="text-lg font-semibold">{t("register.readyToUse")}</p>

                <Link
                    to="/login"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition duration-300 ease-in-out"
                >
                    {t("register.back")}
                </Link>
                <p className='text-sm text-zinc-400 italic' >{t("politicaPrivacidade.contatoDetalhes")}</p>
            </Card>
        </div>
    );
}
