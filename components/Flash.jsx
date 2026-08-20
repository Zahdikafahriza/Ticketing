'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';

const Toast = typeof window !== 'undefined'
  ? Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      didOpen: (el) => {
        el.onmouseenter = Swal.stopTimer;
        el.onmouseleave = Swal.resumeTimer;
      },
    })
  : null;

export default function Flash() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    if (shown.current) return;
    if (!success && !error) return;

    shown.current = true;

    if (success) {
      Toast?.fire({ icon: 'success', title: success });
    } else if (error) {
      Toast?.fire({ icon: 'error', title: error });
    }

    // Bersihkan query param supaya toast tidak muncul lagi kalau halaman di-refresh
    const params = new URLSearchParams(searchParams.toString());
    params.delete('success');
    params.delete('error');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
