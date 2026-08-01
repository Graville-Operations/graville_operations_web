#!/bin/bash
set -e

sed -i "s|import { Site } from '@/types';|import { Site } from '@/lib/types';|" \
  src/hooks/client-invoices/useClientInvoices.ts \
  src/components/finance/client-invoices/SiteFilterDropdown.tsx \
  src/components/finance/client-invoices/InvoiceDetailsFields.tsx

sed -i "s|import { MenuItem } from '@/types';|import { MenuItem } from '@/types/menu';|" \
  src/hooks/layout/useSidebarMenus.ts \
  src/store/menu-store.ts \
  src/lib/api/menu.ts

sed -i "s|import { MenuItem, SubMenu, SubSubMenu } from '@/types';|import { MenuItem, SubMenu, SubSubMenu } from '@/types/menu';|" \
  src/components/layout/sidebar/MenuTree.tsx

sed -i "s|import { SubMenu, SubSubMenu } from '@/types';|import { SubMenu, SubSubMenu } from '@/types/menu';|" \
  src/components/layout/sidebar/SubmenuList.tsx

sed -i "s|import { SubSubMenu } from '@/types';|import { SubSubMenu } from '@/types/menu';|" \
  src/components/layout/sidebar/SubSubmenuList.tsx

sed -i "s|import { ApiUser } from '@/types';|import { ApiUser } from '@/types/users';|" \
  src/hooks/users/useAssignRole.ts \
  src/hooks/users/useUserDetail.ts \
  src/hooks/users/useUsers.ts \
  src/components/users/UserSelectList.tsx \
  src/components/users/UsersTable.tsx \
  src/lib/api/users.ts

sed -i 's|import { ApiUser } from "@/types";|import { ApiUser } from "@/types/users";|' \
  src/hooks/permits/useCreatePermit.ts \
  src/hooks/permits/usePermitsList.ts \
  src/components/permits/DraftEditModal.tsx \
  src/components/permits/ApproverSelect.tsx \
  src/lib/utils/approvers.ts

sed -i "s|import { User } from '@/types';|import { User } from '@/types/users';|" \
  src/store/auth-store.ts

echo "Done."
