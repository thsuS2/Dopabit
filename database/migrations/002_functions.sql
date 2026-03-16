-- 스트릭 계산 함수
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    has_completed BOOLEAN;
BEGIN
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.routines
            WHERE user_id = p_user_id
            AND date = check_date
            AND completed = TRUE
        ) INTO has_completed;

        IF has_completed THEN
            streak_count := streak_count + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    -- users 테이블 업데이트
    UPDATE public.users SET streak = streak_count WHERE id = p_user_id;

    RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- 레벨 계산 함수
CREATE OR REPLACE FUNCTION calculate_level(p_total_score INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN p_total_score >= 10000 THEN 20
        WHEN p_total_score >= 3000 THEN 10
        WHEN p_total_score >= 1000 THEN 5
        WHEN p_total_score >= 300 THEN 3
        ELSE 1
    END;
END;
$$ LANGUAGE plpgsql;

-- 루틴 완료 시 점수/레벨 업데이트 트리거
CREATE OR REPLACE FUNCTION on_routine_completed()
RETURNS TRIGGER AS $$
DECLARE
    new_total INTEGER;
    new_level INTEGER;
BEGIN
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        -- 총 점수 증가
        UPDATE public.users
        SET total_score = total_score + NEW.score
        WHERE id = NEW.user_id
        RETURNING total_score INTO new_total;

        -- 레벨 업데이트
        new_level := calculate_level(new_total);
        UPDATE public.users SET level = new_level WHERE id = NEW.user_id;

        -- 스트릭 재계산
        PERFORM calculate_streak(NEW.user_id);
    ELSIF NEW.completed = FALSE AND OLD.completed = TRUE THEN
        -- 취소 시 점수 감소
        UPDATE public.users
        SET total_score = GREATEST(0, total_score - NEW.score)
        WHERE id = NEW.user_id
        RETURNING total_score INTO new_total;

        new_level := calculate_level(new_total);
        UPDATE public.users SET level = new_level WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER routine_completed_trigger
    AFTER INSERT OR UPDATE OF completed ON public.routines
    FOR EACH ROW
    EXECUTE FUNCTION on_routine_completed();
