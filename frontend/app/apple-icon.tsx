import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Camera body */}
        <div
          style={{
            position: 'absolute',
            left: 28,
            top: 52,
            width: 124,
            height: 84,
            borderRadius: 18,
            border: '10px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Lens outer */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '10px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Lens inner */}
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white' }} />
          </div>
        </div>
        {/* Viewfinder bump */}
        <div
          style={{
            position: 'absolute',
            left: 62,
            top: 34,
            width: 36,
            height: 22,
            borderRadius: 6,
            background: 'white',
          }}
        />
        {/* Flash dot */}
        <div
          style={{
            position: 'absolute',
            right: 38,
            top: 62,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'white',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
