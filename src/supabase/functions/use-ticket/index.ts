import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabaseクライアントの初期化
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // ユーザーIDの取得
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: '認証が必要です' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // リクエストボディの取得
    const { ticketType } = await req.json()

    if (!ticketType) {
      return new Response(
        JSON.stringify({ error: 'チケットタイプが指定されていません' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 使用可能なチケットの確認
    const { data: tickets, error: fetchError } = await supabaseClient
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .eq('ticket_type', ticketType)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(1)

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'チケットの取得に失敗しました' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!tickets || tickets.length === 0) {
      return new Response(
        JSON.stringify({ error: '使用可能なチケットがありません' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const ticket = tickets[0]

    // チケットの使用処理
    if (ticket.quantity <= 1) {
      // チケットを削除
      const { error: deleteError } = await supabaseClient
        .from('tickets')
        .delete()
        .eq('id', ticket.id)

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'チケットの使用に失敗しました' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      // 数量を減らす
      const { error: updateError } = await supabaseClient
        .from('tickets')
        .update({ quantity: ticket.quantity - 1 })
        .eq('id', ticket.id)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'チケットの使用に失敗しました' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'チケットを使用しました',
        remainingQuantity: ticket.quantity > 1 ? ticket.quantity - 1 : 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'サーバーエラーが発生しました' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
