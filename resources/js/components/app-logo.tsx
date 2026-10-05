import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-amber-900 text-stone-100 dark:bg-amber-800">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-stone-900" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Lumaro Furniture Studio
                </span>
            </div>
        </>
    );
}
