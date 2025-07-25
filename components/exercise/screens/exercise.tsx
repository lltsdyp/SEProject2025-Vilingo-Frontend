import React, { useMemo, useState } from "react";
import { router } from "expo-router";

import { sound } from "@/assets/audios/sound";
import { Container } from "@/components/container";
import ExerciseItems from "@/components/exercise/items/exercise-items";
import LessonOutroScreen from "@/components/exercise/screens/exercise-outro";
import { Icon } from "@/components/icons";
import { SelectLanguage } from "@/components/select-language";
import { Shell } from "@/components/shell";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { layouts } from "@/constants/layouts";
import { useBreakpoint } from "@/context/breakpoints";
import { useCourse } from "@/context/course";
import { useTheme } from "@/context/theme";
import { useAudio } from "@/hooks/audio";
import { calculatePrecentage, shuffleArray } from "@/lib/utils";
import { ExerciseSet, ExerciseSetId } from "@/types/course";
import { useExercise } from "@/content/courses/data";

interface Props {
  exerciseId: ExerciseSetId;
  increaseProgress: boolean;
}

export default function ExerciseScreen({ exerciseId, increaseProgress }: Props) {
 // ===================================================================
  // --- 步骤 1: 在组件顶层，无条件地调用所有 Hooks ---
  // ===================================================================

  // 依赖链上游的 Hooks
  const { 
    courseId, 
    isLoading: isCourseLoading,
    isError: isCourseError
  } = useCourse();
  
  const {
    exercise,
    isLoading: isExerciseLoading,
    isError: isExerciseError
  } = useExercise(exerciseId);

  // UI 和状态相关的 Hooks
  const { accent, foreground, mutedForeground } = useTheme();
  const breakpoint = useBreakpoint();
  const { playSound: playCorrectSound } = useAudio({ source: sound.correct });
  const { playSound: playWrongSound } = useAudio({ source: sound.wrong });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // useMemo 也是一个 Hook，也必须在顶层
  const shuffledExerciseItems = useMemo(() => {
    // 注意：在这里需要处理 exercise 可能为 undefined 的情况，
    // 因为守卫逻辑在 useMemo 之后。
    if (!exercise || !Array.isArray(exercise.items)) {
      return [];
    }
    return [...exercise.items];
  }, [exercise]);
  
  const totalExerciseItems = shuffledExerciseItems.length;

  // ===================================================================
  // --- 步骤 2: 在所有 Hooks 调用之后，才开始写条件返回（守卫）---
  // ===================================================================
  
  // 为 useCourse 建立守卫
  if (isCourseLoading) {
    return <Text>Loading Course...</Text>;
  }

  if (isCourseError || !courseId) {
    return <Text>Failed to load course information.</Text>;
  }
  
  // 为 exerciseId prop 建立守卫
  if (!exerciseId || typeof exerciseId.id === 'undefined') {
    return <Text>Error: Invalid Exercise ID provided.</Text>;
  }

  // 为 useExercise 建立守卫
  if (isExerciseLoading) {
    return <Text>Loading Exercise...</Text>;
  }
  
  if (isExerciseError || !exercise) {
    return <Text>Failed to load exercise data.</Text>;
  }
  
  // 为业务逻辑建立守卫
  if (isFinished) {
    return <LessonOutroScreen xp={exercise.xp} /*...*/ duration={""} target={""} increaseProgress={increaseProgress} /*...*/ />;
  }

  const onResult = (success: boolean) => {
    if (finishedCount < totalExerciseItems) {
      setFinishedCount(finishedCount + 1);
      if (success) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }
  };

  const onContinue = () => {
    if (currentIndex < totalExerciseItems - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (!courseId) return null;

  if (isFinished) {
    return (
      <LessonOutroScreen
        xp={exercise.xp}
        duration="2:30"
        target="80%"
        increaseProgress={increaseProgress}
      />
    );
  }

  return (
    <Shell>
      <Container style={{ gap: layouts.padding * 2 }}>
        <View
          style={{
            flexDirection: "row",
            gap: layouts.padding * 2,
            paddingHorizontal: layouts.padding,
            paddingTop:
              breakpoint === "sm" ? layouts.padding : layouts.padding * 2,
          }}
        >
          <Dialog
            trigger={<Icon name="setting" />}
            title="Settings"
            contentContainerStyle={{ gap: layouts.padding }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: mutedForeground,
                  textTransform: "uppercase",
                }}
              >
                Language:
              </Text>
              <SelectLanguage excludes={[courseId]} />
            </View>
            <Button variant="outline" onPress={() => router.push("/learn")}>
              End Session
            </Button>
          </Dialog>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <View
              style={{
                height: 16,
                backgroundColor: accent,
                borderRadius: 16,
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: `${calculatePrecentage(
                    finishedCount,
                    totalExerciseItems
                  )}%`,
                  height: "100%",
                  backgroundColor: foreground,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: layouts.padding * 0.5,
            }}
          >
            <Icon name="heart" />
            <Text style={{ fontWeight: "800" }}>5</Text>
          </View>
        </View>
        <ExerciseItems
          exerciseItem={shuffledExerciseItems[currentIndex]}
          onContinue={onContinue}
          onResult={onResult}
        />
      </Container>
    </Shell>
  );
}
