import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../hooks/useChat';

describe('useChat', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with provided initial messages', () => {
    const initialMessages = [
      {
        id: '1',
        content: 'Hello',
        role: 'user' as const,
        timestamp: new Date(),
      },
    ];
    const { result } = renderHook(() => useChat(undefined, initialMessages));

    expect(result.current.messages).toEqual(initialMessages);
  });

  it('should add user message when sendMessage is called', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[0].role).toBe('user');
  });

  it('should not add empty messages', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should call onSendMessage callback and add response', async () => {
    const mockOnSendMessage = jest.fn().mockResolvedValue('Hi there!');
    const { result } = renderHook(() => useChat(mockOnSendMessage));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello');
    expect(result.current.messages[1].content).toBe('Hi there!');
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('should handle errors from onSendMessage', async () => {
    const mockOnSendMessage = jest.fn().mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useChat(mockOnSendMessage));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.messages).toHaveLength(1); // Only user message
  });

  it('should set isLoading while sending message', async () => {
    let resolvePromise: (value: string) => void;
    const mockOnSendMessage = jest.fn().mockImplementation(() => {
      return new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
    });

    const { result } = renderHook(() => useChat(mockOnSendMessage));

    act(() => {
      result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      resolvePromise!('Response');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should clear messages when clearMessages is called', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
