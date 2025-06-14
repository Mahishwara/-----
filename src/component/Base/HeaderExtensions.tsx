import { atom, useAtomValue, useSetAtom } from "jotai";
import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

const headerExtensionsElementAtom = atom<HTMLDivElement | null>(null);

export const HeaderExtensions: React.FC = () => {
	const setValue = useSetAtom(headerExtensionsElementAtom);
	return <div ref={setValue} />;
};

export const HeaderExtension: React.FC<PropsWithChildren> = ({ children }) => {
	const holder = useAtomValue(headerExtensionsElementAtom);
	if (!holder) return null;
	return createPortal(children, holder);
};
