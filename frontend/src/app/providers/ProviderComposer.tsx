import React, { JSXElementConstructor, PropsWithChildren, ReactNode } from 'react';

interface WithProvidersProps {
    providers: Array<JSXElementConstructor<PropsWithChildren<any>>>;
    children: ReactNode;
}

export const ProviderComposer = ({ providers, children }: WithProvidersProps) => {
    return (
        <>
            {providers.reduceRight((acc, Provider) => {
                return <Provider>{acc}</Provider>;
            }, children)}
        </>
    );
};