<?php

namespace App\Controller;

use App\Entity\Score;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class EditorController extends AbstractController
{
    #[Route('/editor', name: 'app_editor')]
    public function index(Request $request, ManagerRegistry $doctrine): Response
    {   

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['idScore'] = $_POST['idScore'];

        if($_SESSION['idScore'] < 0) {

            $_SESSION['meterUp'] = $_POST['meterUp'];
            $_SESSION['meterDown'] = $_POST['meterDown'];
            $_SESSION['composer'] = $_POST['composer'];
            $_SESSION['title'] = $_POST['title'];
            $_SESSION['key'] = $_POST['key'];
            $_SESSION['tempo'] = $_POST['tempo'];
            $_SESSION['instruments'] = $_POST['instruments'];

            $errors = false;

            if(!preg_match('/^([3|4]{1})$/', $_SESSION['meterUp'])) {
            
                $this->addFlash(
                    'meterUp',
                    'Nieprawidłowe metrum górne - wprowadź prawidłową wartość'
                );
                $errors = true;
            }
    
            if(!preg_match('/^([4|8]{1})$/', $_SESSION['meterDown'])) {
                
                $this->addFlash(
                    'meterUp',
                    'Nieprawidłowe metrum dolne - wprowadź prawidłową wartość'
                );
                $errors = true;
            }
            
            if(!preg_match('/^([C|bbb]{1})$/', $_SESSION['key'])) {
                
                $this->addFlash(
                    'key',
                    'Nieprawidłowa tonacja - wprowadź prawidłową wartość'
                );
                $errors = true;
            }

            if(!preg_match('/^([F|G]{1,10})$/', $_SESSION['instruments'])) {
                
                $this->addFlash(
                    'instruments',
                    'Nieprawidłowe klucze - wprowadź prawidłową wartość'
                );
                $errors = true;
            }

            if($errors) {
                return $this->redirectToRoute('app_scores_private');
            }

            $em = $doctrine->getManager();

            $score = new Score();

            $score->setComposer($_SESSION['composer']);
            $score->setTitle($_SESSION['title']);
            $score->setPublic(1);
            $score->setUser($this->getUser());

            $sc = array('x' => 0); 

            $score->setScore($sc);
            $score->setScoreParam($sc);

            $em->persist($score);
            $em->flush();

            $lastId = $score->getId();

            $_SESSION['idScoreLast'] = $lastId;
        }

        return $this->render('editor/index.html.twig', [
            'controller_name' => 'EditorController',
        ]);
    }
}
