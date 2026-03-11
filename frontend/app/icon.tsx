import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
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
            left: 5,
            top: 9,
            width: 22,
            height: 15,
            borderRadius: 3,
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Lens */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'white' }} />
          </div>
        </div>
        {/* Viewfinder bump */}
        <div
          style={{
            position: 'absolute',
            left: 11,
            top: 6,
            width: 6,
            height: 4,
            borderRadius: 1,
            background: 'white',
          }}
        />
        {/* Flash dot */}
        <div
          style={{
            position: 'absolute',
            right: 7,
            top: 11,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'white',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
