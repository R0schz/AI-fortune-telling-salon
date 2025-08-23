import { supabase } from '../client';

export interface Ticket {
  id: string;
  user_id: string;
  ticket_type: string;
  quantity: number;
  expires_at: string;
  created_at: string;
}

export async function getUserTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user tickets:', error);
    throw new Error('チケットの取得に失敗しました。');
  }
  return data || [];
}

export async function useTicket(userId: string, ticketType: string): Promise<boolean> {
  const { data: tickets, error: fetchError } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .eq('ticket_type', ticketType)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(1);

  if (fetchError) {
    console.error('Error fetching tickets for use:', fetchError);
    throw new Error('チケットの取得に失敗しました。');
  }

  if (!tickets || tickets.length === 0) {
    throw new Error('使用可能なチケットがありません。');
  }

  const ticket = tickets[0];
  
  if (ticket.quantity <= 1) {
    // チケットを削除
    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticket.id);

    if (deleteError) {
      console.error('Error deleting used ticket:', deleteError);
      throw new Error('チケットの使用に失敗しました。');
    }
  } else {
    // 数量を減らす
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ quantity: ticket.quantity - 1 })
      .eq('id', ticket.id);

    if (updateError) {
      console.error('Error updating ticket quantity:', updateError);
      throw new Error('チケットの使用に失敗しました。');
    }
  }

  return true;
}

export async function addTickets(userId: string, ticketType: string, quantity: number, expiresAt: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      user_id: userId,
      ticket_type: ticketType,
      quantity,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding tickets:', error);
    throw new Error('チケットの追加に失敗しました。');
  }
  return data;
}
