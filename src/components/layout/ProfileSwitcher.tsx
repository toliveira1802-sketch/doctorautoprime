/**
 * @deprecated Este componente está deprecated.
 * Use UnifiedViewSwitcher ao invés deste.
 * 
 * Este arquivo será removido em versões futuras.
 * Mantido temporariamente para compatibilidade.
 */

import { useNavigate } from "react-router-dom";
import { UnifiedViewSwitcher } from "./UnifiedViewSwitcher";

/**
 * @deprecated Use UnifiedViewSwitcher
 */
export function ProfileSwitcher() {
    console.warn('ProfileSwitcher is deprecated. Use UnifiedViewSwitcher instead.');
    return <UnifiedViewSwitcher variant="buttons" />;
}
