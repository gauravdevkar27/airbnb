📦 airbnb-clone
│
├── app/                        # Next.js App Router
│
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── listings/
│   │   └── properties/
│
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│
│   ├── (dashboard)/
│   │   ├── host/
│   │   ├── admin/
│   │   └── user/
│
│   ├── api/
│   └── layout.tsx
│
├── modules/                    # Business Features
│
│   ├── auth/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── types/
│   │   └── routes/
│
│   ├── users/
│   │
│   ├── listings/
│   │
│   ├── reservations/
│   │
│   ├── reviews/
│   │
│   ├── payments/
│   │
│   ├── notifications/
│   │
│   └── admin/
│
├── components/
│
│   ├── ui/                     # Generic reusable UI
│   ├── forms/
│   ├── modals/
│   ├── navbar/
│   ├── cards/
│   └── shared/
│
├── hooks/
│
│   ├── useCurrentUser.ts
│   ├── useLoginModal.ts
│   ├── useDebounce.ts
│   └── usePagination.ts
│
├── services/
│
│   ├── cloudinary/
│   ├── email/
│   ├── payment/
│   └── cache/
│
├── lib/
│
│   ├── prisma.ts
│   ├── auth.ts
│   ├── constants.ts
│   ├── utils.ts
│   └── validations.ts
│
├── actions/
│
│   ├── listing/
│   ├── reservation/
│   ├── review/
│   └── user/
│
├── store/
│
│   ├── authStore.ts
│   ├── filterStore.ts
│   └── modalStore.ts
│
├── types/
│
│   ├── listing.ts
│   ├── reservation.ts
│   ├── review.ts
│   └── user.ts
│
├── prisma/
│
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│
├── tests/
│
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── middleware.ts
├── next.config.ts
└── package.json