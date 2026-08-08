import os

base_dir = "/Users/gustavobraulio/Desktop/EconomizeJá/apps/api"

# Fix seed.ts
seed_path = os.path.join(base_dir, "prisma/seed.ts")
with open(seed_path, 'r') as f:
    seed = f.read()
seed = seed.replace("incomeCategory.id", "incomeCategory!.id").replace("expenseCategory.id", "expenseCategory!.id")
with open(seed_path, 'w') as f:
    f.write(seed)

# Fix auth.controller.ts
auth_ctrl_path = os.path.join(base_dir, "src/auth/auth.controller.ts")
with open(auth_ctrl_path, 'r') as f:
    auth_ctrl = f.read()
auth_ctrl = auth_ctrl.replace("import { Request, Response } from 'express';", "import type { Request, Response } from 'express';")
with open(auth_ctrl_path, 'w') as f:
    f.write(auth_ctrl)

# Fix main.ts
main_path = os.path.join(base_dir, "src/main.ts")
with open(main_path, 'r') as f:
    main = f.read()
main = main.replace("import * as cookieParser from 'cookie-parser';", "import * as cookieParser from 'cookie-parser';") # wait, default import needs esModuleInterop
main = main.replace("import * as cookieParser from 'cookie-parser';", "const cookieParser = require('cookie-parser');")
main = main.replace("import * as compression from 'compression';", "const compression = require('compression');")
with open(main_path, 'w') as f:
    f.write(main)

