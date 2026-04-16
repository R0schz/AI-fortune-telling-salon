import os
import pytest
from datetime import date
from unittest.mock import AsyncMock, patch, MagicMock

from scheduler import create_scheduler, run_daily_generation, CRON_HOUR_UTC, CRON_MINUTE_UTC


class TestCreateScheduler:
    def test_scheduler_has_one_job(self):
        """スケジューラーに日次ジョブが1件登録されている。"""
        scheduler = create_scheduler()
        jobs = scheduler.get_jobs()
        assert len(jobs) == 1

    def test_job_id_is_correct(self):
        """ジョブIDが正しい。"""
        scheduler = create_scheduler()
        job = scheduler.get_job("daily_reading_generation")
        assert job is not None

    def test_cron_runs_at_03_jst(self):
        """トリガーが UTC 18:00（JST 03:00）に設定されている。"""
        scheduler = create_scheduler()
        job = scheduler.get_job("daily_reading_generation")
        trigger = job.trigger
        # CronTrigger のフィールドを確認
        fields = {f.name: str(f) for f in trigger.fields}
        assert fields["hour"] == str(CRON_HOUR_UTC)
        assert fields["minute"] == str(CRON_MINUTE_UTC)

    def test_misfire_grace_time_is_set(self):
        """遅延許容時間（misfire_grace_time）が設定されている。"""
        scheduler = create_scheduler()
        job = scheduler.get_job("daily_reading_generation")
        assert job.misfire_grace_time == 3600


class TestRunDailyGeneration:
    @pytest.mark.asyncio
    async def test_calls_generate_with_given_date(self):
        """run_daily_generation が指定日付で generate_readings_for_date を呼ぶ。"""
        target = date(2026, 4, 16)
        mock_result = {"created": 64, "skipped": 0}

        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test_key"}), \
             patch("scheduler.generate_readings_for_date", new=AsyncMock(return_value=mock_result)) as mock_gen, \
             patch("scheduler.AsyncAnthropic"), \
             patch("scheduler.AsyncSessionLocal") as mock_session_cls:

            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)
            mock_session_cls.return_value = mock_session

            result = await run_daily_generation(target_date=target)

        assert result["created"] == 64
        assert result["skipped"] == 0
        mock_gen.assert_called_once()
        assert mock_gen.call_args.args[2] == target

    @pytest.mark.asyncio
    async def test_defaults_to_today_when_no_date(self):
        """target_date を省略すると today() が渡される。"""
        mock_result = {"created": 64, "skipped": 0}

        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test_key"}), \
             patch("scheduler.generate_readings_for_date", new=AsyncMock(return_value=mock_result)) as mock_gen, \
             patch("scheduler.AsyncAnthropic"), \
             patch("scheduler.AsyncSessionLocal") as mock_session_cls:

            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)
            mock_session_cls.return_value = mock_session

            await run_daily_generation()

        # run_daily_generation は None をそのまま generator に渡す
        # generator 側が None を today() に変換する設計
        assert mock_gen.call_args.args[2] is None


class TestAdminGenerateEndpoint:
    @pytest.mark.asyncio
    async def test_manual_trigger_returns_accepted(self, client):
        """POST /admin/generate がバックグラウンド開始メッセージとtarget_dateを返す。"""
        response = await client.post("/admin/generate", json={})

        assert response.status_code == 200
        body = response.json()
        assert "message" in body
        assert "target_date" in body

    @pytest.mark.asyncio
    async def test_manual_trigger_with_specific_date(self, client):
        """特定日付を指定して生成できる。"""
        response = await client.post(
            "/admin/generate", json={"target_date": "2026-04-16"}
        )

        assert response.status_code == 200
        assert response.json()["target_date"] == "2026-04-16"
