import { test, expect,vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import App from './App';
import axios from 'axios';

test('renders App component', async () => {

    vi.spyOn(axios, 'get').mockImplementation(() => Promise.resolve({ data: {date:"test success"} }));

    render(<App />);
    // 例: "learn react" というテキストが含まれているかをテスト
    // 実際のAppコンポーネントの内容に合わせて修正してください
    expect(screen.getByText("Vite + React")).toBeInTheDocument();
    expect(await screen.findByText(/test success/i)).toBeInTheDocument();
});