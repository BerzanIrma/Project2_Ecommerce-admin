import { auth } from '@clerk/nextjs/server';

export default async function SetupLayout({
    children
}: {
    children: React.ReactNode;
}) {
    await auth();
    return (<>{children}</>);
}
