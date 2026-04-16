/// オンボーディング画面
/// 生年月日と16タイプを入力してもらう初回セットアップ。
library;

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mellow/features/onboarding/onboarding_provider.dart';
import 'package:mellow/features/onboarding/user_profile.dart';
import 'package:mellow/features/reading/reading_screen.dart';
import 'package:url_launcher/url_launcher.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  DateTime _birthday = DateTime(2000, 1, 1);
  String? _selectedType;
  bool _saving = false;

  static const _typeLabels = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  Future<void> _pickBirthday() async {
    DateTime? picked = _birthday;
    await showCupertinoModalPopup<void>(
      context: context,
      builder: (_) => Container(
        height: 280,
        color: const Color(0xFF1A1A2E),
        child: CupertinoDatePicker(
          mode: CupertinoDatePickerMode.date,
          initialDateTime: _birthday,
          maximumDate: DateTime.now(),
          minimumYear: 1900,
          onDateTimeChanged: (d) => picked = d,
        ),
      ),
    );
    setState(() => _birthday = picked ?? _birthday);
  }

  Future<void> _save() async {
    if (_selectedType == null) return;
    setState(() => _saving = true);
    final profile = UserProfile(birthday: _birthday, mbtiType: _selectedType!);
    await ref.read(userProfileProvider.notifier).save(profile);
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(builder: (_) => const ReadingScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final birthdayText =
        '${_birthday.year}/${_birthday.month.toString().padLeft(2, '0')}/${_birthday.day.toString().padLeft(2, '0')}';

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'mellow',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w300,
                  color: Color(0xFFB8A9C9),
                  letterSpacing: 6,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'あなたのことを教えてください',
                style: TextStyle(fontSize: 14, color: Color(0xFF8C8C9E)),
              ),
              const SizedBox(height: 48),

              // 生年月日
              _SectionLabel(label: '生年月日'),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: _pickBirthday,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A2E),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF2E2E44)),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.calendar_today_outlined,
                        size: 16,
                        color: Color(0xFFB8A9C9),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        birthdayText,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFFE8E4F0),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 36),

              // 16タイプ選択
              Row(
                children: [
                  _SectionLabel(label: '16タイプ'),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () async {
                      final uri = Uri.parse(
                        'https://www.16personalities.com/ja',
                      );
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(
                          uri,
                          mode: LaunchMode.externalApplication,
                        );
                      }
                    },
                    child: const Text(
                      'わからない方はこちら',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF8C8C9E),
                        decoration: TextDecoration.underline,
                        decorationColor: Color(0xFF8C8C9E),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _typeLabels.map((type) {
                  final selected = _selectedType == type;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedType = type),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: selected
                            ? const Color(0xFFB8A9C9)
                            : const Color(0xFF1A1A2E),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: selected
                              ? const Color(0xFFB8A9C9)
                              : const Color(0xFF2E2E44),
                        ),
                      ),
                      child: Text(
                        type,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: selected
                              ? const Color(0xFF0D0D0D)
                              : const Color(0xFF8C8C9E),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const Spacer(),

              // 免責事項
              const Text(
                '本アプリは娯楽・内省サポートを目的としており、医療・心理診断・人生の重大な決断の代替を意図するものではありません。',
                style: TextStyle(fontSize: 10, color: Color(0xFF5C5C6E)),
              ),

              const SizedBox(height: 20),

              // 始めるボタン
              SizedBox(
                width: double.infinity,
                child: AnimatedOpacity(
                  opacity: _selectedType != null ? 1.0 : 0.4,
                  duration: const Duration(milliseconds: 200),
                  child: ElevatedButton(
                    onPressed: _selectedType != null && !_saving ? _save : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFB8A9C9),
                      foregroundColor: const Color(0xFF0D0D0D),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(0xFF0D0D0D),
                            ),
                          )
                        : const Text(
                            'はじめる',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 2,
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 12,
        letterSpacing: 1.5,
        color: Color(0xFF8C8C9E),
      ),
    );
  }
}
