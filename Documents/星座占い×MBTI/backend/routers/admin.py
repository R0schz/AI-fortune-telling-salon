import asyncio
from datetime import date
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])

_generation_status: dict[str, object] = {"running": False, "last_result": None}


class GenerateRequest(BaseModel):
    target_date: date | None = None


class GenerateResponse(BaseModel):
    message: str
    target_date: date


class GenerateStatusResponse(BaseModel):
    running: bool
    last_result: dict | None


async def _run_generation_task(target: date) -> None:
    from scheduler import run_daily_generation

    _generation_status["running"] = True
    try:
        result = await run_daily_generation(target_date=target)
        _generation_status["last_result"] = {
            "created": result["created"],
            "skipped": result["skipped"],
            "target_date": target.isoformat(),
        }
    except Exception as e:
        _generation_status["last_result"] = {"error": str(e)}
    finally:
        _generation_status["running"] = False


@router.post("/generate", response_model=GenerateResponse)
async def trigger_generation(
    background_tasks: BackgroundTasks,
    body: GenerateRequest = GenerateRequest(),
):
    """
    リーディングを手動生成するエンドポイント（バックグラウンド実行）。
    本番運用・障害復旧時の再実行に使用する。
    target_date を省略すると今日の日付で生成する。
    /admin/generate/status で進捗を確認できる。
    """
    if _generation_status["running"]:
        raise HTTPException(status_code=409, detail="Generation already in progress")

    target = body.target_date or date.today()
    background_tasks.add_task(_run_generation_task, target)

    return GenerateResponse(
        message="Generation started in background. Check /admin/generate/status for progress.",
        target_date=target,
    )


@router.get("/generate/status", response_model=GenerateStatusResponse)
async def get_generation_status():
    """生成の進捗状態を返す。"""
    return GenerateStatusResponse(
        running=bool(_generation_status["running"]),
        last_result=_generation_status.get("last_result"),
    )
